package com.stock.analysis.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {
    private UUID id;
    private String settingKey;
    private String settingValue;
    private String category;
    private String description;
    private String dataType;
    private boolean isPublic;
}
