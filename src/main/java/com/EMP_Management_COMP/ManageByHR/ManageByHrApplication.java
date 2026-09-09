package com.EMP_Management_COMP.ManageByHR;

import java.net.ServerSocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationContextInitializedEvent;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ManageByHrApplication {

	private static final int PORT = 9899;

	public static void main(String[] args) {
		// ==== AGGRESSIVE SOCKET REUSE CONFIGURATION ====
		
		// JVM-level socket reuse (most important)
		System.setProperty("server.socket.so-reuse-addr", "true");
		System.setProperty("server.socket.so-keep-alive", "true");
		System.setProperty("sun.rmi.transport.tcp.tcpnodelay", "true");
		
		// Tomcat configuration
		System.setProperty("server.tomcat.connection-timeout", "20000");
		System.setProperty("server.tomcat.socket-options.SO_REUSEADDR", "true");
		System.setProperty("server.tomcat.socket-options.SO_KEEPALIVE", "true");
		
		// OS-level networking
		System.setProperty("java.net.preferIPv4Stack", "true");
		
		// Verify port is available BEFORE starting Spring
		if (!isPortAvailable(PORT)) {
			System.err.println("ERROR: Port " + PORT + " is still in use!");
			System.err.println("Cannot start application. Force-kill the blocking process.");
			System.exit(1);
		}
		
		System.out.println("✓ Port " + PORT + " is available - Starting application");
		SpringApplication.run(ManageByHrApplication.class, args);
	}

	// Check if port is available (before Spring starts)
	private static boolean isPortAvailable(int port) {
		try (ServerSocket socket = new ServerSocket(port)) {
			socket.setReuseAddress(true);
			System.out.println("✓ Port " + port + " is available - Socket reuse enabled");
			return true;
		} catch (Exception e) {
			System.err.println("✗ Port " + port + " is NOT available");
			System.err.println("  Error: " + e.getMessage());
			return false;
		}
	}

	@EventListener
	public void handleContextStart(ApplicationContextInitializedEvent event) {
		System.out.println("✓ ManageByHR Application Context Initialized");
	}

	@EventListener
	public void handleApplicationReady(ApplicationReadyEvent event) {
		System.out.println("╔════════════════════════════════════════════════════════════╗");
		System.out.println("║                 ✅ APPLICATION READY                      ║");
		System.out.println("║         Access at: http://localhost:9899                  ║");
		System.out.println("╚════════════════════════════════════════════════════════════╝");
	}

}
