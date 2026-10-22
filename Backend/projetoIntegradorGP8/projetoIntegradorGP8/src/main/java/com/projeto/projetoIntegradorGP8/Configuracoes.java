package com.projeto.projetoIntegradorGP8;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

@Entity
public class Configuracoes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String horarioFuncionamento;

    @Column(nullable = false)
    private String intervaloDasConsultas;

    @Column(nullable = false)
    private String diasFuncionamento;

    @Column(nullable = true)
    private String alteracoesDeFuncionamento;

}
