package com.stock.analysis.admin.service;

import com.stock.analysis.admin.dto.AdminDashboardResponseDto;
import com.stock.analysis.kyc.KycRequestRepository;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.trading.repository.OrderRepository;
import com.stock.analysis.users.UserRepository;
import com.stock.analysis.wallet.repository.DepositRequestRepository;
import com.stock.analysis.wallet.repository.WithdrawalRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
// import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private DepositRequestRepository depositRequestRepository;

    @Mock
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Mock
    private StockRepository stockRepository;

    @Mock
    private KycRequestRepository kycRequestRepository;

    @InjectMocks
    private AdminDashboardService dashboardService;

    @BeforeEach
    void setUp() {
    }

    @Test
    @DisplayName("Should successfully aggregate enterprise dashboard analytics")
    void testGetDashboardAnalyticsSuccess() {
        when(userRepository.count()).thenReturn(1500L);
        when(userRepository.countByEnabledTrue()).thenReturn(1420L);
        when(kycRequestRepository.countByStatus("APPROVED")).thenReturn(1200L);
        when(stockRepository.count()).thenReturn(50L);

        AdminDashboardResponseDto result = dashboardService.getDashboardAnalytics();

        assertThat(result).isNotNull();
        assertThat(result.getUserMetrics().getTotalUsers()).isEqualTo(1500L);
        assertThat(result.getUserMetrics().getVerifiedUsers()).isEqualTo(1200L);
        assertThat(result.getMarketMetrics().getActiveTickersCount()).isEqualTo(50L);
        assertThat(result.getMarketMetrics().getMarketStatus()).isEqualTo("OPEN");
    }
}
