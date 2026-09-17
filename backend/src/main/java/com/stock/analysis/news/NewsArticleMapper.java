package com.stock.analysis.news;

import com.stock.analysis.mapper.BaseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NewsArticleMapper extends BaseMapper<NewsArticleDto, NewsArticle> {
}
