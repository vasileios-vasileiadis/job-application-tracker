package com.portfolio.jobtracker.repository;

import com.portfolio.jobtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
}
