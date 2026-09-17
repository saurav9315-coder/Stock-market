package com.stock.analysis.trading.service;

import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.FeeBreakdown;
import com.stock.analysis.trading.entity.DiscountRule;
import com.stock.analysis.trading.entity.FeeStructure;
import com.stock.analysis.trading.repository.DiscountRuleRepository;
import com.stock.analysis.trading.repository.FeeStructureRepository;
import com.stock.analysis.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeeCalculationServiceImpl implements FeeCalculationService {

    private final FeeStructureRepository feeStructureRepository;
    private final DiscountRuleRepository discountRuleRepository;

    @Override
    @Transactional(readOnly = true)
    public FeeBreakdown calculateFees(OrderSide side, TradingMode mode, BigDecimal quantity, BigDecimal price, User user) {
        if (quantity == null || price == null || quantity.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
            return FeeBreakdown.builder()
                    .brokerageFee(BigDecimal.ZERO)
                    .platformFee(BigDecimal.ZERO)
                    .taxAmount(BigDecimal.ZERO)
                    .gstAmount(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .totalFee(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal tradeValue = quantity.multiply(price);

        // Fetch active fee structure or fall back to default
        FeeStructure feeStructure = feeStructureRepository.findFirstByActiveTrueOrderByCreatedAtDesc()
                .orElseGet(() -> FeeStructure.builder()
                        .name("DEFAULT")
                        .brokerageRatePct(new BigDecimal("0.0010")) // 0.1%
                        .platformFeeFlat(new BigDecimal("1.0000"))   // $1.00
                        .taxRatePct(new BigDecimal("0.0005"))       // 0.05%
                        .gstRatePct(new BigDecimal("0.1800"))       // 18%
                        .build());

        // Base brokerage
        BigDecimal rawBrokerage = tradeValue.multiply(feeStructure.getBrokerageRatePct()).setScale(4, RoundingMode.HALF_UP);
        BigDecimal platformFee = feeStructure.getPlatformFeeFlat().setScale(4, RoundingMode.HALF_UP);

        // Calculate volume discounts if available
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (feeStructure.getId() != null) {
            List<DiscountRule> rules = discountRuleRepository.findByFeeStructureIdAndActiveTrue(feeStructure.getId());
            for (DiscountRule rule : rules) {
                if (rule.getMinVolume() != null && tradeValue.compareTo(rule.getMinVolume()) >= 0) {
                    BigDecimal ruleDiscount = rawBrokerage.multiply(rule.getDiscountPct()).setScale(4, RoundingMode.HALF_UP);
                    if (ruleDiscount.compareTo(discountAmount) > 0) {
                        discountAmount = ruleDiscount;
                    }
                }
            }
        }

        BigDecimal netBrokerage = rawBrokerage.subtract(discountAmount).max(BigDecimal.ZERO);

        // Tax (e.g. STT / Securities Transaction Tax)
        BigDecimal taxAmount = tradeValue.multiply(feeStructure.getTaxRatePct()).setScale(4, RoundingMode.HALF_UP);

        // GST / VAT (applied to Net Brokerage + Platform Fee)
        BigDecimal feeTaxableAmount = netBrokerage.add(platformFee);
        BigDecimal gstAmount = feeTaxableAmount.multiply(feeStructure.getGstRatePct()).setScale(4, RoundingMode.HALF_UP);

        BigDecimal totalFee = netBrokerage.add(platformFee).add(taxAmount).add(gstAmount).setScale(4, RoundingMode.HALF_UP);

        return FeeBreakdown.builder()
                .brokerageFee(netBrokerage)
                .platformFee(platformFee)
                .taxAmount(taxAmount)
                .gstAmount(gstAmount)
                .discountAmount(discountAmount)
                .totalFee(totalFee)
                .build();
    }
}
