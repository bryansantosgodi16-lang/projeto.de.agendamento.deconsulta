package com.projeto.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PacienteRequest(
        @NotBlank @Size(max = 120) String nomeCompleto,
        @NotBlank @Size(max = 30) String telefone,
        @NotBlank @Size(max = 40) String convenio,
        LocalDate dataNascimento,
        @Email @Size(max = 255) String email,
        @Size(max = 2000) String observacao) {}
