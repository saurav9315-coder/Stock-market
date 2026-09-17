package com.stock.analysis.trading.service;

import com.stock.analysis.trading.dto.DividendPayoutResponse;
import com.stock.analysis.trading.dto.DividendRequest;
import com.stock.analysis.trading.dto.DividendResponse;
import com.stock.analysis.users.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DividendService {

    DividendResponse announceDividend(DividendRequest request, String createdBy);

    List<DividendPayoutResponse> processDividendPayouts(UUID dividendId);

    Page<DividendPayoutResponse> getUserDividendPayouts(User user, Pageable pageable);
}
