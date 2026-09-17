package com.stock.analysis.trading;

import com.stock.analysis.market.Stock;
import com.stock.analysis.portfolio.Holding;
import com.stock.analysis.portfolio.Portfolio;
import com.stock.analysis.trading.domain.OrderSide;
import com.stock.analysis.trading.domain.OrderType;
import com.stock.analysis.trading.domain.TradingMode;
import com.stock.analysis.trading.dto.OrderCreateRequest;
import com.stock.analysis.trading.repository.HoldingRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.trading.repository.WalletBalanceRepository;
import com.stock.analysis.trading.service.ValidationServiceImpl;
import com.stock.analysis.users.User;
import com.stock.analysis.wallet.WalletBalance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ValidationServiceTest {

    @Mock
    private WalletBalanceRepository walletBalanceRepository;

    @Mock
    private HoldingRepository holdingRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ValidationServiceImpl validationService;

    private User testUser;
    private Stock testStock;
    private Portfolio testPortfolio;

    @BeforeEach
    void setUp() {
        testUser = User.builder().username("trader1").build();
        testUser.setId(UUID.randomUUID());

        testStock = Stock.builder().symbol("AAPL").name("Apple Inc.").active(true).build();
        testStock.setId(UUID.randomUUID());

        testPortfolio = Portfolio.builder().user(testUser).name("Demo").tradingMode(TradingMode.DEMO).build();
        testPortfolio.setId(UUID.randomUUID());
    }

    @Test
    void validateOrderRequest_InactiveStock_ThrowsException() {
        Stock inactive = Stock.builder().symbol("XYZ").active(false).build();
        OrderCreateRequest req = OrderCreateRequest.builder().symbol("XYZ").quantity(new BigDecimal("10")).side(OrderSide.BUY).orderType(OrderType.MARKET).build();

        assertThrows(IllegalArgumentException.class, () -> validationService.validateOrderRequest(testUser, req, inactive, testPortfolio));
    }

    @Test
    void validateOrderRequest_MissingLimitPriceForLimitOrder_ThrowsException() {
        OrderCreateRequest req = OrderCreateRequest.builder()
                .symbol("AAPL")
                .quantity(new BigDecimal("10"))
                .side(OrderSide.BUY)
                .orderType(OrderType.LIMIT)
                .limitPrice(null)
                .build();

        assertThrows(IllegalArgumentException.class, () -> validationService.validateOrderRequest(testUser, req, testStock, testPortfolio));
    }

    @Test
    void validateSufficientBalance_InsufficientFunds_ThrowsException() {
        WalletBalance balance = WalletBalance.builder()
                .demoAvailableBalance(new BigDecimal("50.00"))
                .build();

        when(walletBalanceRepository.findByWalletUserId(testUser.getId())).thenReturn(Optional.of(balance));

        assertThrows(IllegalArgumentException.class, () ->
                validationService.validateSufficientBalance(testUser, TradingMode.DEMO, new BigDecimal("100.00")));
    }

    @Test
    void validateSufficientHoldings_SufficientShares_DoesNotThrow() {
        Holding holding = Holding.builder()
                .portfolio(testPortfolio)
                .stock(testStock)
                .quantity(new BigDecimal("50.00"))
                .build();

        when(holdingRepository.findByPortfolioIdAndStockId(testPortfolio.getId(), testStock.getId()))
                .thenReturn(Optional.of(holding));

        assertDoesNotThrow(() -> validationService.validateSufficientHoldings(testPortfolio, testStock, new BigDecimal("20.00")));
    }
}
