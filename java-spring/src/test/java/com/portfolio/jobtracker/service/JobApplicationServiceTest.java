package com.portfolio.jobtracker.service;

import com.portfolio.jobtracker.model.ApplicationStatus;
import com.portfolio.jobtracker.model.JobApplication;
import com.portfolio.jobtracker.repository.JobApplicationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository repository;

    @InjectMocks
    private JobApplicationService service;

    @Test
    void createSavesApplicationInRepository() {
        JobApplication application = new JobApplication(
                "Example Ltd",
                "Junior Java Developer",
                LocalDate.of(2026, 9, 1),
                ApplicationStatus.APPLIED,
                new BigDecimal("25000"),
                "Portfolio test"
        );

        service.create(application);

        verify(repository).save(application);
    }
}
