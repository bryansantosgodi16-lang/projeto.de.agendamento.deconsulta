package com.projeto.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "pacientes")
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String nomeCompleto;
    @Column(nullable = false, length = 30)
    private String telefone;
    @Column(nullable = false, length = 40)
    private String convenio;
    private LocalDate dataNascimento;
    @Column(length = 255)
    private String email;
    @Column(length = 2000)
    private String observacao;

    protected Paciente() {}

    public Paciente(String nomeCompleto, String telefone, String convenio, LocalDate dataNascimento,
            String email, String observacao) {
        this.nomeCompleto = nomeCompleto;
        this.telefone = telefone;
        this.convenio = convenio;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.observacao = observacao;
    }

    public Long getId() { return id; }
    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getConvenio() { return convenio; }
    public void setConvenio(String convenio) { this.convenio = convenio; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
