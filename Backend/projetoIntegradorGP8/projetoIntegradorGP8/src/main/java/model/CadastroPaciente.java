package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.time.LocalDate;

@Entity
public class CadastroPaciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String convenio;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String observacao;
}
