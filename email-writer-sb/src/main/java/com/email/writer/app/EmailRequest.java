package com.email.writer.app;

// import help get getter setter and constrctor
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class EmailRequest {
    // define structure of email request
    private String emailContent;
    // how we want the tone of email to be
    private String tone;
}
