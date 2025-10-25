"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Wind } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function LoginForm({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    
    // Navigate to home page
    onLogin(email)
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onLogin(`${provider}@example.com`)
  }

  return (
    <View className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo and Header */}
      <View className="text-center space-y-3">
        <View className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2 animate-in zoom-in duration-500 delay-100">
          <Wind className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </View>
        <Text className="text-4xl font-light tracking-tight text-foreground">Aetheria</Text>
        <Text className="text-sm text-muted-foreground font-light tracking-wide">Terapia Respiratória Interativa</Text>
      </View>

      {/* Login Card */}
      <Card className="p-8 shadow-lg border-border/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <View className="space-y-6">
          <View className="space-y-2">
            <Label className="text-sm font-normal text-foreground/80">
              Email
            </Label>
            <TextInput
              className="h-12 bg-input border-border/50 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50 rounded-md px-3"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="space-y-2">
            <View className="flex items-center justify-between">
              <Label className="text-sm font-normal text-foreground/80">
                Senha
              </Label>
              <TouchableOpacity>
                <Text className="text-xs text-primary hover:text-primary/80 transition-colors duration-200 font-normal">
                  Esqueceu?
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="h-12 bg-input border-border/50 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50 rounded-md px-3"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-normal tracking-wide transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] rounded-md items-center justify-center"
          >
            {isLoading ? (
              <View className="flex items-center gap-2">
                <View className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <Text className="text-primary-foreground">Entrando...</Text>
              </View>
            ) : (
              <Text className="text-primary-foreground font-normal">Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="relative my-6">
          <View className="absolute inset-0 flex items-center">
            <View className="w-full border-t border-border/50" />
          </View>
          <View className="relative flex justify-center text-xs">
            <Text className="bg-card px-3 text-muted-foreground font-light">ou continue com</Text>
          </View>
        </View>

        {/* Social Login */}
        <View className="grid grid-cols-2 gap-3">
          <TouchableOpacity
            onPress={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="h-11 border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 font-normal bg-transparent rounded-md border items-center justify-center flex-row"
          >
            <Text className="text-foreground">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSocialLogin("github")}
            disabled={isLoading}
            className="h-11 border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300 font-normal bg-transparent rounded-md border items-center justify-center flex-row"
          >
            <Text className="text-foreground">GitHub</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Sign Up Link */}
      <Text className="text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
        Não tem uma conta?{" "}
        <TouchableOpacity>
          <Text className="text-primary hover:text-primary/80 transition-colors duration-200 font-normal">
            Criar conta
          </Text>
        </TouchableOpacity>
      </Text>

      {/* Footer */}
      <Text className="text-center text-xs text-muted-foreground/60 animate-in fade-in duration-700 delay-400 font-light">
        Jogos divertidos para melhorar sua respiração
      </Text>
    </View>
  )
}
