package com.projeto.controller;

import com.projeto.dto.ConfiguracaoAgendaRequest;
import com.projeto.model.ConfiguracaoAgenda;
import com.projeto.service.ConfiguracaoAgendaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/configuracoes/agenda")
public class ConfiguracaoAgendaController {
    private final ConfiguracaoAgendaService configuracoes;

    public ConfiguracaoAgendaController(ConfiguracaoAgendaService configuracoes) {
        this.configuracoes = configuracoes;
    }

    @GetMapping
    public ConfiguracaoAgenda obter() { return configuracoes.obter(); }

    @PutMapping
    public ConfiguracaoAgenda atualizar(@Valid @RequestBody ConfiguracaoAgendaRequest dados) {
        return configuracoes.atualizar(dados);
    }
}
