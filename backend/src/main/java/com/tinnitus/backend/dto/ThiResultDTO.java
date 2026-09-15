package com.tinnitus.backend.dto;

import com.tinnitus.backend.model.entity.ThiResult;
import java.time.LocalDateTime;

public record ThiResultDTO(
    Long id,
    Integer total,
    String grade,
    Integer functional,
    Integer emotional,
    Integer catastrophic,
    String answers,
    LocalDateTime createdAt
) {
    public static ThiResultDTO from(ThiResult t) {
        return new ThiResultDTO(
            t.getId(), t.getTotal(), t.getGrade(),
            t.getFunctional(), t.getEmotional(), t.getCatastrophic(),
            t.getAnswers(), t.getCreatedAt()
        );
    }
}
