package com.projeto.repository;

import com.projeto.model.Agendamento;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findAllByOrderByDataDescHoraAsc();
    List<Agendamento> findByDataOrderByHoraAsc(LocalDate data);
    List<Agendamento> findByStatusOrderByDataDescHoraAsc(String status);
    List<Agendamento> findByPaciente_IdOrderByDataDescHoraDesc(Long pacienteId);
    List<Agendamento> findByPaciente_IdAndStatusAndDataLessThanEqualOrderByDataDescHoraDesc(
            Long pacienteId, String status, LocalDate data);
    boolean existsByDataAndHoraAndStatusNot(LocalDate data, LocalTime hora, String status);
}
