package com.email.writer.app;

import java.util.Map;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailGeneratorService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailGeneratorService.class);
    private final WebClient webclient;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webclient = webClientBuilder.build();
    }
    
    @Value("${gemini.api.url}")
    private String GeminiApiUrl;
    @Value("${gemini.api.key}")
    private String GeminiApiKey;
    // prepare this service to make an api call

    public String generateEmailReply(EmailRequest emailRequest){
        // build the prompt as input to gemini
        String prompt=buildPrompt(emailRequest);
        logger.info("Generated prompt: {}", prompt);        // craft a reqeust to send to gemini
        // create a structure for request
        Map<String,Object>requestBody=Map.of(
            "contents",new Object[]{
                Map.of(
                "parts", new Object[]{
                    Map.of("text",prompt)
                })
            }
        );
        logger.info("Request body: {}", requestBody);        
        // send api call request and get responose
        // need api key and url
        String response = webclient.post()
            .uri(GeminiApiUrl+GeminiApiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();
        logger.error("API response : {}", response);        // return response
        return extractResponse(response);
             
    }
                
    private String extractResponse(String response) {
        // extract the response from json
        try{
            // create a object mapped
            // object mapper converts json data to java objects and vice versa
            ObjectMapper mapper=new ObjectMapper();
            // readtree return resp into tree like structure
            JsonNode rootNode=mapper.readTree(response);
            return rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        }catch(Exception e){
            return "error: "+e.getMessage();
        }

    }
        
    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate an email response for the following email content. Please dont generate a subject line ");
        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a ").append(emailRequest.getTone()).append("tone .");
        }
        prompt.append("\nOriginal Email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
