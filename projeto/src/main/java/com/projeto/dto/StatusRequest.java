package com.projeto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StatusRequest(@NotBlank String status, @Size(max = 500) String motivoCancelamento) {}
