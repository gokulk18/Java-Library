package com.library.borrow;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowRepository extends MongoRepository<Borrow, String> {
    List<Borrow> findByMemberId(String memberId);
}
