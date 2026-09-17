package com.stock.analysis.market.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileDto {
    private String symbol;
    private String name;
    private String ceo;
    private String sector;
    private String industry;
    private String description;
    private String website;
    private Long marketCap;
    private BigDecimal peRatio;
    private BigDecimal dividendYield;
    private String headquarters;
    private Long employees;
}
