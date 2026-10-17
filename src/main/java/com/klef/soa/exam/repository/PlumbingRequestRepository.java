package com.klef.soa.exam.repository;

import com.klef.soa.exam.entity.PlumbingRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlumbingRequestRepository extends JpaRepository<PlumbingRequestEntity, Long> {
}
