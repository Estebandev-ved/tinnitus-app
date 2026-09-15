package com.tinnitus.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "thi_results")
public class ThiResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total")
    private Integer total;

    @Column(name = "result_grade")
    private String grade;

    @Column(name = "functional")
    private Integer functional;

    @Column(name = "emotional")
    private Integer emotional;

    @Column(name = "catastrophic")
    private Integer catastrophic;

    @Column(name = "answers", columnDefinition = "TEXT")
    private String answers;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public Integer getFunctional() { return functional; }
    public void setFunctional(Integer functional) { this.functional = functional; }
    public Integer getEmotional() { return emotional; }
    public void setEmotional(Integer emotional) { this.emotional = emotional; }
    public Integer getCatastrophic() { return catastrophic; }
    public void setCatastrophic(Integer catastrophic) { this.catastrophic = catastrophic; }
    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
