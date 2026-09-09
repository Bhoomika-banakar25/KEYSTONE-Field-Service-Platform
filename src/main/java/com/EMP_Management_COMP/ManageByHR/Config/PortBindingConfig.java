package com.EMP_Management_COMP.ManageByHR.Config;

import org.springframework.context.annotation.Configuration;
import java.net.ServerSocket;

/**
 * Aggressive port binding configuration to prevent port 9899 conflicts.
 * This ensures the port is available and socket reuse is enabled.
 */
@Configuration
public class PortBindingConfig {

    private static final int TARGET_PORT = 9899;
    private static final String PORT_NAME = "ManageByHR";

    static {
        // AGGRESSIVE: Static initialization block runs FIRST, before Spring context
        initializePortBinding();
    }

    private static void initializePortBinding() {
        System.out.println("\n╔════════════════════════════════════════════════════════════╗");
        System.out.println("║        PORT BINDING CONFIGURATION - INITIALIZING         ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝\n");

        // Verify port is available
        verifyPortAvailable();

        // Configure socket reuse at JVM level
        configureSocketReuse();

        System.out.println("✓ Port binding configuration complete\n");
    }

    private static void verifyPortAvailable() {
        try (ServerSocket socket = new ServerSocket(TARGET_PORT)) {
            socket.setReuseAddress(true);
            System.out.println("✓ Port " + TARGET_PORT + " is available");
        } catch (Exception e) {
            System.err.println("✗ FATAL: Port " + TARGET_PORT + " is NOT available!");
            System.err.println("  Error: " + e.getMessage());
            System.err.println("  Kill the blocking process and restart.");
            throw new RuntimeException("Port " + TARGET_PORT + " is in use", e);
        }
    }

    private static void configureSocketReuse() {
        // Maximum aggressive socket reuse configuration
        String[][] properties = {
            // Socket reuse
            {"server.socket.so-reuse-addr", "true"},
            {"server.socket.so-keep-alive", "true"},
            {"sun.rmi.transport.tcp.tcpnodelay", "true"},
            {"sun.rmi.dgc.leaseCheckInterval", "60000"},
            
            // Tomcat settings
            {"server.tomcat.connection-timeout", "20000"},
            {"server.tomcat.socket-options.SO_REUSEADDR", "true"},
            {"server.tomcat.socket-options.SO_KEEPALIVE", "true"},
            
            // Java networking
            {"java.net.preferIPv4Stack", "true"},
            {"java.net.preferIPv6Addresses", "false"},
            
            // TCP settings
            {"com.sun.net.httpserver.HttpServer.bind", "true"}
        };

        for (String[] prop : properties) {
            System.setProperty(prop[0], prop[1]);
            System.out.println("  ✓ " + prop[0] + " = " + prop[1]);
        }
    }

}
