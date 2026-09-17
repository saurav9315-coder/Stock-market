package com.stock.analysis.news;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-01T18:49:57+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class NewsArticleMapperImpl implements NewsArticleMapper {

    @Override
    public NewsArticle toEntity(NewsArticleDto dto) {
        if ( dto == null ) {
            return null;
        }

        NewsArticle.NewsArticleBuilder<?, ?> newsArticle = NewsArticle.builder();

        newsArticle.id( dto.getId() );
        newsArticle.content( dto.getContent() );
        newsArticle.publishedAt( dto.getPublishedAt() );
        newsArticle.sentiment( dto.getSentiment() );
        newsArticle.source( dto.getSource() );
        newsArticle.title( dto.getTitle() );
        newsArticle.url( dto.getUrl() );

        return newsArticle.build();
    }

    @Override
    public NewsArticleDto toDto(NewsArticle entity) {
        if ( entity == null ) {
            return null;
        }

        NewsArticleDto.NewsArticleDtoBuilder newsArticleDto = NewsArticleDto.builder();

        newsArticleDto.content( entity.getContent() );
        newsArticleDto.id( entity.getId() );
        newsArticleDto.publishedAt( entity.getPublishedAt() );
        newsArticleDto.sentiment( entity.getSentiment() );
        newsArticleDto.source( entity.getSource() );
        newsArticleDto.title( entity.getTitle() );
        newsArticleDto.url( entity.getUrl() );

        return newsArticleDto.build();
    }

    @Override
    public List<NewsArticle> toEntityList(List<NewsArticleDto> dtoList) {
        if ( dtoList == null ) {
            return null;
        }

        List<NewsArticle> list = new ArrayList<NewsArticle>( dtoList.size() );
        for ( NewsArticleDto newsArticleDto : dtoList ) {
            list.add( toEntity( newsArticleDto ) );
        }

        return list;
    }

    @Override
    public List<NewsArticleDto> toDtoList(List<NewsArticle> entityList) {
        if ( entityList == null ) {
            return null;
        }

        List<NewsArticleDto> list = new ArrayList<NewsArticleDto>( entityList.size() );
        for ( NewsArticle newsArticle : entityList ) {
            list.add( toDto( newsArticle ) );
        }

        return list;
    }

    @Override
    public void updateEntityFromDto(NewsArticleDto dto, NewsArticle entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getContent() != null ) {
            entity.setContent( dto.getContent() );
        }
        if ( dto.getPublishedAt() != null ) {
            entity.setPublishedAt( dto.getPublishedAt() );
        }
        if ( dto.getSentiment() != null ) {
            entity.setSentiment( dto.getSentiment() );
        }
        if ( dto.getSource() != null ) {
            entity.setSource( dto.getSource() );
        }
        if ( dto.getTitle() != null ) {
            entity.setTitle( dto.getTitle() );
        }
        if ( dto.getUrl() != null ) {
            entity.setUrl( dto.getUrl() );
        }
    }
}
