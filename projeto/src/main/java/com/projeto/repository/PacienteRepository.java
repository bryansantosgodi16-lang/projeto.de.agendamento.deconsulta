package com.projeto.repository;

import com.projeto.model.Paciente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    List<Paciente> findAllByOrderByNomeCompletoAsc();

    List<Paciente> findByNomeCompletoContainingIgnoreCaseOrTelefoneContainingOrConvenioContainingIgnoreCase(
            String nome, String telefone, String convenio);
}
