package com.projeto.controller;

import com.projeto.dto.AgendamentoResponse;
import com.projeto.dto.PacienteRequest;
import com.projeto.model.Paciente;
import com.projeto.service.AgendamentoService;
import com.projeto.service.PacienteService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {
    private final PacienteService pacientes;
    private final AgendamentoService agendamentos;

    public PacienteController(PacienteService pacientes, AgendamentoService agendamentos) {
        this.pacientes = pacientes;
        this.agendamentos = agendamentos;
    }

    @GetMapping
    public List<Paciente> listar(@RequestParam(required = false) String busca) {
        return pacientes.listar(busca);
    }

    @GetMapping("/{id}")
    public Paciente buscar(@PathVariable Long id) { return pacientes.buscar(id); }

    @GetMapping("/{id}/agendamentos")
    public List<AgendamentoResponse> historico(@PathVariable Long id) { return agendamentos.historico(id); }

    @PostMapping
    public ResponseEntity<Paciente> criar(@Valid @RequestBody PacienteRequest dados) {
        Paciente paciente = pacientes.criar(dados);
        return ResponseEntity.created(URI.create("/api/pacientes/" + paciente.getId())).body(paciente);
    }

    @PutMapping("/{id}")
    public Paciente atualizar(@PathVariable Long id, @Valid @RequestBody PacienteRequest dados) {
        return pacientes.atualizar(id, dados);
    }
}
