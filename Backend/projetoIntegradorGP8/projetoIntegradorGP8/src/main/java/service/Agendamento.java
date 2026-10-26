package service;
import org.springframework.stereotype.Service;

@Service
public class Agendamento {

    public String verificarHorario(boolean horarioDisponivel) {

        if (horarioDisponivel) {
            return "Horário disponível para agendamento!";
        }

        return "Esse horário já está ocupado!";
    }
}
