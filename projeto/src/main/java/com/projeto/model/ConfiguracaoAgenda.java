package com.projeto.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalTime;

@Entity
@Table(name = "configuracao_agenda")
public class ConfiguracaoAgenda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalTime horarioInicio;
    private LocalTime horarioFim;
    private Integer intervaloMinutos;

    protected ConfiguracaoAgenda() {}

    public ConfiguracaoAgenda(LocalTime horarioInicio, LocalTime horarioFim, Integer intervaloMinutos) {
        this.horarioInicio = horarioInicio;
        this.horarioFim = horarioFim;
        this.intervaloMinutos = intervaloMinutos;
    }

    public Long getId() { return id; }
    public LocalTime getHorarioInicio() { return horarioInicio; }
    public void setHorarioInicio(LocalTime horarioInicio) { this.horarioInicio = horarioInicio; }
    public LocalTime getHorarioFim() { return horarioFim; }
    public void setHorarioFim(LocalTime horarioFim) { this.horarioFim = horarioFim; }
    public Integer getIntervaloMinutos() { return intervaloMinutos; }
    public void setIntervaloMinutos(Integer intervaloMinutos) { this.intervaloMinutos = intervaloMinutos; }
}
