package in.madhuroil.catalog.web;

import in.madhuroil.catalog.service.ReviewService;
import in.madhuroil.catalog.service.ReviewService.SubmitReviewForm;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalogue/reviews")
@RequiredArgsConstructor
public class ReviewSubmissionController {

    private final ReviewService reviews;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void submit(@Valid @RequestBody SubmitReviewForm form) {
        reviews.submit(form);
    }
}
