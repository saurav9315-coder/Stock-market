package com.stock.analysis.market.service;

import com.stock.analysis.market.CompanyProfile;
import com.stock.analysis.market.CompanyProfileRepository;
import com.stock.analysis.market.Stock;
import com.stock.analysis.market.StockRepository;
import com.stock.analysis.market.dto.CompanyProfileDto;
import com.stock.analysis.market.mapper.CompanyProfileMapper;
import com.stock.analysis.market.provider.ProviderManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
public class CompanyService {

    private final CompanyProfileRepository companyProfileRepository;
    private final StockRepository stockRepository;
    private final CompanyProfileMapper companyProfileMapper;
    private final ProviderManager providerManager;
    private final CacheService cacheService;

    public CompanyService(
            CompanyProfileRepository companyProfileRepository,
            StockRepository stockRepository,
            CompanyProfileMapper companyProfileMapper,
            ProviderManager providerManager,
            CacheService cacheService) {
        this.companyProfileRepository = companyProfileRepository;
        this.stockRepository = stockRepository;
        this.companyProfileMapper = companyProfileMapper;
        this.providerManager = providerManager;
        this.cacheService = cacheService;
    }

    @Transactional
    public CompanyProfileDto getCompanyProfile(String symbol) {
        String cacheKey = "company_profile:" + symbol;
        CompanyProfileDto cached = (CompanyProfileDto) cacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Check Database
        Optional<CompanyProfile> dbProfile = companyProfileRepository.findByStockSymbol(symbol);
        if (dbProfile.isPresent()) {
            CompanyProfileDto dto = companyProfileMapper.toDto(dbProfile.get());
            cacheService.put(cacheKey, dto, Duration.ofDays(1));
            return dto;
        }

        // Fetch from Provider
        CompanyProfileDto fetchedDto = providerManager.getCompanyProfile(symbol);

        // Save to DB if Stock exists
        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
        if (stockOpt.isPresent()) {
            Stock stock = stockOpt.get();
            CompanyProfile entity = companyProfileMapper.toEntity(fetchedDto);
            entity.setStock(stock);
            companyProfileRepository.save(entity);
        }

        cacheService.put(cacheKey, fetchedDto, Duration.ofDays(1));
        return fetchedDto;
    }
}
