package com.EMP_Management_COMP.ManageByHR.Config;

import java.net.ServerSocket;

import org.springframework.context.annotation.Configuration;

/**
 * Permanent port binding solution with automatic fallback.
 * - Primary port: 9899
 * - Fallback ports: 9800, 9801, 9802, 9803, 9804
 * - Automatically finds an available port and applies socket reuse configuration
 */
@Configuration
public class PortBindingConfig {

    private static final int PRIMARY_PORT = 9899;
    private static final int[] FALLBACK_PORTS = {9800, 9801, 9802, 9803, 9804};
    private static int ACTIVE_PORT = PRIMARY_PORT;

    static {
        // Static initialization runs FIRST, before Spring context
        initializePortBinding();
    }

    private static void initializePortBinding() {
        System.out.println("\n╔════════════════════════════════════════════════════════════╗");
        System.out.println("║        PORT BINDING CONFIGURATION - INITIALIZING         ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝\n");

        // Find an available port (try primary first, then fallbacks)
        findAvailablePort();

        // Configure socket reuse at JVM level
        configureSocketReuse();

        System.out.println("✓ Port binding configuration complete");
        System.out.println("✓ Application will run on port: " + ACTIVE_PORT + "\n");
    }

    private static void findAvailablePort() {
        // Try primary port first
        if (isPortAvailable(PRIMARY_PORT)) {
            ACTIVE_PORT = PRIMARY_PORT;
            System.out.println("✓ Port " + PRIMARY_PORT + " is available");
            return;
        }

        System.out.println("✗ Port " + PRIMARY_PORT + " is NOT available");
        System.out.println("  Trying fallback ports...");

        // Try fallback ports
        for (int port : FALLBACK_PORTS) {
            if (isPortAvailable(port)) {
                ACTIVE_PORT = port;
                System.out.println("✓ Port " + port + " is available - using as fallback");
                return;
            } else {
                System.out.println("  ✗ Port " + port + " is busy");
            }
        }

        // If we reach here, no ports are available
        System.err.println("\n✗ FATAL: No ports available (9899, 9800-9804)!");
        System.err.println("  Run: .\\cleanup-port.ps1");
        System.err.println("  Then restart the application");
        throw new RuntimeException("No available ports (9899, 9800-9804 are all in use)");
    }

    private static boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket(port)) {
            socket.setReuseAddress(true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static void configureSocketReuse() {
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

    public static int getActivePort() {
        return ACTIVE_PORT;
    }
}
