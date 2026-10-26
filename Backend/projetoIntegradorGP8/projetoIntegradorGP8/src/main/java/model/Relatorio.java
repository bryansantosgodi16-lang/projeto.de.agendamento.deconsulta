package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.time.LocalDate;

@Entity
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomePaciente;

    @Column(nullable = false)
    private LocalDate dataConsulta;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String fichaPaciente;

    @Column(nullable = false)
    private String retornoConsulta;
}


