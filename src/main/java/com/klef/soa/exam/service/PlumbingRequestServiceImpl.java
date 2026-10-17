package com.klef.soa.exam.service;

import com.klef.soa.exam.entity.PlumbingRequestEntity;
import com.klef.soa.exam.repository.PlumbingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlumbingRequestServiceImpl implements PlumbingRequestService {

    @Autowired
    private PlumbingRequestRepository repository;

    @Override
    public PlumbingRequestEntity addRequest(PlumbingRequestEntity request) {
        request.setId(null); // always let the database generate the ID
        return repository.save(request);
    }

    @Override
    public List<PlumbingRequestEntity> displayAll() {
        return repository.findAll();
    }

    @Override
    public boolean deleteRequest(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
