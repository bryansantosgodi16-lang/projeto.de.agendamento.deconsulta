package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.*;
import java.time.LocalDate;



@Entity
@Table(name = "pacientes")
public class Pacientes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto;

    private LocalDate dataNascimento;

    private String endereco;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String convenio;

    private String naturalidade;

    private String estadoCivil;

    private Integer consultasRealizadas;
}

















    

