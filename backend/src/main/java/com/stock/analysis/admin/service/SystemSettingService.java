package com.stock.analysis.admin.service;

import com.stock.analysis.admin.domain.SystemSetting;
import com.stock.analysis.admin.dto.SystemSettingDto;
import com.stock.analysis.admin.repository.SystemSettingRepository;
import com.stock.analysis.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public List<SystemSettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SystemSettingDto> getSettingsByCategory(String category) {
        return systemSettingRepository.findByCategory(category).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SystemSettingDto getSettingByKey(String key) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("System setting not found: " + key));
        return toDto(setting);
    }

    @Transactional
    public SystemSettingDto updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("System setting not found: " + key));

        setting.setSettingValue(value);
        SystemSetting updated = systemSettingRepository.save(setting);
        log.info("System setting updated: {} = {}", key, value);
        return toDto(updated);
    }

    private SystemSettingDto toDto(SystemSetting s) {
        return SystemSettingDto.builder()
                .id(s.getId())
                .settingKey(s.getSettingKey())
                .settingValue(s.getSettingValue())
                .category(s.getCategory())
                .description(s.getDescription())
                .dataType(s.getDataType())
                .isPublic(s.isPublic())
                .build();
    }
}
