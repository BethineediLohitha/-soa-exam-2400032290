package com.klef.soa.exam.service;

import com.klef.soa.exam.entity.PlumbingRequestEntity;
import java.util.List;

public interface PlumbingRequestService {
    PlumbingRequestEntity addRequest(PlumbingRequestEntity request);
    List<PlumbingRequestEntity> displayAll();
    boolean deleteRequest(Long id);
}
