package service;

import org.springframework.stereotype.Service;

@Service
public class CadastroPaciente {

    public String cadastrarPaciente(String nomeCompleto, String telefone,
                                    String convenio, String email) {

        if (nomeCompleto == null || nomeCompleto.isBlank()) {
            return "O nome do paciente é obrigatório!";
        }

        if (telefone == null || telefone.isBlank()) {
            return "O telefone do paciente é obrigatório!";
        }

        if (convenio == null || convenio.isBlank()) {
            return "O convênio do paciente é obrigatório!";
        }

        if (email == null || email.isBlank()) {
            return "O e-mail do paciente é obrigatório!";
        }

        return "Paciente cadastrado com sucesso!";
    }
}
