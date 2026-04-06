package com.library.borrow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${book-service.url}")
    private String bookServiceUrl;

    @GetMapping
    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestBody Map<String, String> payload) {
        String bookId = payload.get("bookId");
        String memberId = payload.get("memberId");

        // 1. Check book availability
        String bookUrl = bookServiceUrl + "/api/books/" + bookId;
        Map<String, Object> book;
        try {
            book = restTemplate.getForObject(bookUrl, Map.class);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Book not found");
        }

        if (book == null || !book.containsKey("availableCopies")) {
            return ResponseEntity.badRequest().body("Book not found");
        }

        int availableCopies = (Integer) book.get("availableCopies");
        if (availableCopies <= 0) {
            return ResponseEntity.badRequest().body("Book is not available");
        }

        // 2. Decrement available copies
        book.put("availableCopies", availableCopies - 1);
        restTemplate.put(bookUrl, book);

        // 3. Create borrow record
        Borrow borrow = new Borrow(bookId, memberId, LocalDate.now().toString(), "BORROWED");
        Borrow saved = borrowRepository.save(borrow);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/return/{id}")
    public ResponseEntity<?> returnBook(@PathVariable String id) {
        return borrowRepository.findById(id).map(borrow -> {
            if ("RETURNED".equals(borrow.getStatus())) {
                return ResponseEntity.badRequest().body("Book already returned");
            }

            // 1. Get book and increment available copies
            String bookUrl = bookServiceUrl + "/api/books/" + borrow.getBookId();
            try {
                Map<String, Object> book = restTemplate.getForObject(bookUrl, Map.class);
                if (book != null) {
                    int availableCopies = (Integer) book.get("availableCopies");
                    book.put("availableCopies", availableCopies + 1);
                    restTemplate.put(bookUrl, book);
                }
            } catch (Exception e) {
                // Handle book service error, but proceed with return
                System.err.println("Error updating book copies: " + e.getMessage());
            }

            // 2. Update borrow record
            borrow.setStatus("RETURNED");
            borrow.setReturnDate(LocalDate.now().toString());
            Borrow updated = borrowRepository.save(borrow);

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    public List<Borrow> getBorrowsByMember(@PathVariable String memberId) {
        return borrowRepository.findByMemberId(memberId);
    }
}
