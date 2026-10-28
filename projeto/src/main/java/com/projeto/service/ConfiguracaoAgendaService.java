package com.projeto.service;

import com.projeto.dto.ConfiguracaoAgendaRequest;
import com.projeto.model.ConfiguracaoAgenda;
import com.projeto.repository.ConfiguracaoAgendaRepository;
import java.time.LocalTime;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ConfiguracaoAgendaService {
    private static final Set<Integer> INTERVALOS_PERMITIDOS = Set.of(15, 30, 60);
    private final ConfiguracaoAgendaRepository configuracoes;

    public ConfiguracaoAgendaService(ConfiguracaoAgendaRepository configuracoes) {
        this.configuracoes = configuracoes;
    }

    public ConfiguracaoAgenda obter() {
        return configuracoes.findAll().stream().findFirst().orElseGet(() ->
                configuracoes.save(new ConfiguracaoAgenda(LocalTime.of(9, 0), LocalTime.of(18, 0), 15)));
    }

    public ConfiguracaoAgenda atualizar(ConfiguracaoAgendaRequest dados) {
        validar(dados);
        ConfiguracaoAgenda atual = obter();
        atual.setHorarioInicio(dados.horarioInicio());
        atual.setHorarioFim(dados.horarioFim());
        atual.setIntervaloMinutos(dados.intervaloMinutos());
        return configuracoes.save(atual);
    }

    private void validar(ConfiguracaoAgendaRequest dados) {
        if (!dados.horarioInicio().isBefore(dados.horarioFim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O horário final deve ser após o inicial.");
        }
        if (!INTERVALOS_PERMITIDOS.contains(dados.intervaloMinutos())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O intervalo deve ser 15, 30 ou 60 minutos.");
        }
    }
}
