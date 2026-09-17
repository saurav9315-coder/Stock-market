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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeeCalculationServiceTest {

    @Mock
    private FeeStructureRepository feeStructureRepository;

    @Mock
    private DiscountRuleRepository discountRuleRepository;

    @InjectMocks
    private FeeCalculationServiceImpl feeCalculationService;

    private User testUser;
    private FeeStructure defaultFeeStructure;

    @BeforeEach
    void setUp() {
        testUser = User.builder().username("trader1").email("trader@stock.com").build();
        defaultFeeStructure = FeeStructure.builder()
                .id(UUID.randomUUID())
                .name("DEFAULT")
                .brokerageRatePct(new BigDecimal("0.0010")) // 0.1%
                .platformFeeFlat(new BigDecimal("1.0000"))   // $1.00
                .taxRatePct(new BigDecimal("0.0005"))       // 0.05%
                .gstRatePct(new BigDecimal("0.1800"))       // 18%
                .build();
    }

    @Test
    void calculateFees_StandardTrade_ReturnsCorrectBreakdown() {
        when(feeStructureRepository.findFirstByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Optional.of(defaultFeeStructure));
        when(discountRuleRepository.findByFeeStructureIdAndActiveTrue(any()))
                .thenReturn(Collections.emptyList());

        BigDecimal quantity = new BigDecimal("100");
        BigDecimal price = new BigDecimal("150.00"); // Trade value = $15,000

        FeeBreakdown fee = feeCalculationService.calculateFees(OrderSide.BUY, TradingMode.DEMO, quantity, price, testUser);

        assertNotNull(fee);
        // Brokerage = 15,000 * 0.0010 = 15.0000
        assertEquals(new BigDecimal("15.0000"), fee.getBrokerageFee());
        // Platform Fee = 1.0000
        assertEquals(new BigDecimal("1.0000"), fee.getPlatformFee());
        // Tax = 15,000 * 0.0005 = 7.5000
        assertEquals(new BigDecimal("7.5000"), fee.getTaxAmount());
        // GST = (15 + 1) * 0.18 = 2.8800
        assertEquals(new BigDecimal("2.8800"), fee.getGstAmount());
        // Total Fee = 15 + 1 + 7.5 + 2.88 = 26.3800
        assertEquals(new BigDecimal("26.3800"), fee.getTotalFee());
    }

    @Test
    void calculateFees_ZeroQuantity_ReturnsZeroFees() {
        FeeBreakdown fee = feeCalculationService.calculateFees(OrderSide.BUY, TradingMode.DEMO, BigDecimal.ZERO, new BigDecimal("150.00"), testUser);
        assertEquals(BigDecimal.ZERO, fee.getTotalFee());
    }
}
