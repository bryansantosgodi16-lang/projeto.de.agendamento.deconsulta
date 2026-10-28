package com.projeto.controller;

import com.projeto.dto.RelatorioResponse;
import com.projeto.service.RelatorioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
    private final RelatorioService relatorios;

    public RelatorioController(RelatorioService relatorios) { this.relatorios = relatorios; }

    @GetMapping
    public RelatorioResponse obter() { return relatorios.obter(); }
}
