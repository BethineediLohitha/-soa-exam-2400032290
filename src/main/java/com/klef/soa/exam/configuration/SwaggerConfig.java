package com.klef.soa.exam.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Plumbing Request CRUD Service")
                .version("1.0")
                .description("SOA Practical Exam - CRUD service registered with Eureka"));
    }
}
