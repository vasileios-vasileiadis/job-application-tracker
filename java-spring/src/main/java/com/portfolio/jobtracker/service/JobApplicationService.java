package com.portfolio.jobtracker.service;

import com.portfolio.jobtracker.model.JobApplication;
import com.portfolio.jobtracker.repository.JobApplicationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    public List<JobApplication> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "applicationDate"));
    }

    public JobApplication findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Application not found"
                ));
    }

    public JobApplication create(JobApplication application) {
        return repository.save(application);
    }

    public JobApplication update(Long id, JobApplication changes) {
        JobApplication existing = findById(id);

        existing.setCompany(changes.getCompany());
        existing.setPosition(changes.getPosition());
        existing.setApplicationDate(changes.getApplicationDate());
        existing.setStatus(changes.getStatus());
        existing.setSalary(changes.getSalary());
        existing.setNotes(changes.getNotes());

        return repository.save(existing);
    }

    public void delete(Long id) {
        JobApplication existing = findById(id);
        repository.delete(existing);
    }
}
