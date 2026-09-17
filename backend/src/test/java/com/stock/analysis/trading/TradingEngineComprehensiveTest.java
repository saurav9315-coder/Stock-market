package com.stock.analysis.trading;

import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.entity.FeeStructure;
import com.stock.analysis.trading.repository.DiscountRuleRepository;
import com.stock.analysis.trading.repository.FeeStructureRepository;
import com.stock.analysis.trading.service.FeeCalculationServiceImpl;
import com.stock.analysis.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TradingEngineComprehensiveTest {

    @Mock
    private FeeStructureRepository feeStructureRepository;

    @Mock
    private DiscountRuleRepository discountRuleRepository;

    @InjectMocks
    private FeeCalculationServiceImpl feeCalculationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("trader_pro")
                .email("trader@quant.com")
                .build();
    }

    @Test
    @DisplayName("Should return zero fee breakdown for null or zero quantity/price")
    void testZeroQuantityOrPriceReturnsZeroFees() {
        FeeBreakdown breakdown = feeCalculationService.calculateFees(
                OrderSide.BUY,
                TradingMode.LIVE,
                BigDecimal.ZERO,
                new BigDecimal("150.00"),
                testUser
        );

        assertThat(breakdown.getTotalFee()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(breakdown.getBrokerageFee()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should correctly calculate default fees for valid trade")
    void testCalculateDefaultFees() {
        when(feeStructureRepository.findFirstByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Optional.empty()); // fallback to default

        BigDecimal quantity = new BigDecimal("10");
        BigDecimal price = new BigDecimal("100.00"); // Trade value = $1000.00

        FeeBreakdown breakdown = feeCalculationService.calculateFees(
                OrderSide.BUY,
                TradingMode.LIVE,
                quantity,
                price,
                testUser
        );

        assertThat(breakdown).isNotNull();
        // Brokerage = 1000 * 0.0010 = 1.0000
        assertThat(breakdown.getBrokerageFee()).isEqualByComparingTo(new BigDecimal("1.0000"));
        // Platform fee = 1.0000
        assertThat(breakdown.getPlatformFee()).isEqualByComparingTo(new BigDecimal("1.0000"));
        // Tax = 1000 * 0.0005 = 0.5000
        assertThat(breakdown.getTaxAmount()).isEqualByComparingTo(new BigDecimal("0.5000"));
        // GST = (1.0000 + 1.0000) * 0.18 = 0.3600
        assertThat(breakdown.getGstAmount()).isEqualByComparingTo(new BigDecimal("0.3600"));
        // Total = 1 + 1 + 0.5 + 0.36 = 2.8600
        assertThat(breakdown.getTotalFee()).isEqualByComparingTo(new BigDecimal("2.8600"));
    }

    @Test
    @DisplayName("Should calculate fees using customized fee structure")
    void testCustomFeeStructureCalculation() {
        FeeStructure customStructure = FeeStructure.builder()
                .id(UUID.randomUUID())
                .name("VIP_TIER")
                .brokerageRatePct(new BigDecimal("0.0005")) // 0.05%
                .platformFeeFlat(new BigDecimal("0.5000"))   // $0.50
                .taxRatePct(new BigDecimal("0.0002"))       // 0.02%
                .gstRatePct(new BigDecimal("0.1000"))       // 10%
                .build();

        when(feeStructureRepository.findFirstByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Optional.of(customStructure));
        when(discountRuleRepository.findByFeeStructureIdAndActiveTrue(any()))
                .thenReturn(Collections.emptyList());

        BigDecimal quantity = new BigDecimal("100");
        BigDecimal price = new BigDecimal("200.00"); // Trade value = $20,000.00

        FeeBreakdown breakdown = feeCalculationService.calculateFees(
                OrderSide.SELL,
                TradingMode.LIVE,
                quantity,
                price,
                testUser
        );

        assertThat(breakdown.getBrokerageFee()).isEqualByComparingTo(new BigDecimal("10.0000"));
        assertThat(breakdown.getPlatformFee()).isEqualByComparingTo(new BigDecimal("0.5000"));
        assertThat(breakdown.getTaxAmount()).isEqualByComparingTo(new BigDecimal("4.0000"));
        assertThat(breakdown.getGstAmount()).isEqualByComparingTo(new BigDecimal("1.0500"));
    }
}
