 package model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

@Entity
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String totalConsulta;

    @Column(nullable = false)
    private String pacienteNovo;

    @Column(nullable = false)
    private String consultaRetorno;

    @Column(nullable = false)
    private String consultaCancelada;

    @Column(nullable = false)
    private String marcarRetorno;

    @Column(nullable = false)
    private String agendaConsulta;

    @Column(nullable = false)
    private String buscaPaciente;

    @Column(nullable = false)
    private String pacienteDia;

    @Column(nullable = false)
    private String novoAgendamento;
}