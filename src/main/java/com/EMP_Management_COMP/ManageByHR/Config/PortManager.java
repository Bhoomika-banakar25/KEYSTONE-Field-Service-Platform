package com.EMP_Management_COMP.ManageByHR.Config;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.stereotype.Component;

/**
 * Automatic Port Manager - Handles port conflicts gracefully
 * If primary port 9899 is unavailable, tries fallback ports: 9800-9804
 */
@Component
public class PortManager implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    private static final int PRIMARY_PORT = 9899;
    private static final int[] FALLBACK_PORTS = {9800, 9801, 9802, 9803, 9804};

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        // Try primary port first
        int availablePort = findAvailablePort(PRIMARY_PORT);
        
        if (availablePort != PRIMARY_PORT) {
            System.out.println("⚠️  Port " + PRIMARY_PORT + " is busy");
            System.out.println("🔄 Trying fallback ports...");
        }
        
        factory.setPort(availablePort);
        System.out.println("✅ Application will run on port: " + availablePort);
    }

    /**
     * Find an available port starting from the primary port
     */
    private int findAvailablePort(int startPort) {
        // First check if primary port is available
        if (isPortAvailable(startPort)) {
            return startPort;
        }

        // Try fallback ports
        for (int port : FALLBACK_PORTS) {
            if (isPortAvailable(port)) {
                return port;
            }
        }

        // If all ports are busy, use Spring's random port
        System.out.println("⚠️  All configured ports are busy. Using random available port.");
        return 0; // 0 = random port
    }

    /**
     * Check if a port is available
     */
    private boolean isPortAvailable(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            serverSocket.setReuseAddress(true);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}
