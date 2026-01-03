import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GithubLogo, Waveform, ChartLine, Bell, Brain, Shield, Lightning } from '@phosphor-icons/react'

interface LoginPageProps {
  onLogin: () => void
  isLoading?: boolean
}

export function LoginPage({ onLogin, isLoading = false }: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Waveform size={36} weight="bold" className="text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  VoiceWatch AI
                </h1>
                <p className="text-lg text-muted-foreground">Conversational LLM Observability</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-foreground/90">
                The next-generation AI monitoring platform that combines voice-driven intelligence with 
                real-time observability for your LLM applications.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ChartLine size={24} className="text-primary flex-shrink-0" weight="duotone" />
                  <div>
                    <div className="font-semibold text-sm">Real-Time Analytics</div>
                    <div className="text-xs text-muted-foreground">Live metrics & insights</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Bell size={24} className="text-warning flex-shrink-0" weight="duotone" />
                  <div>
                    <div className="font-semibold text-sm">Smart Alerts</div>
                    <div className="text-xs text-muted-foreground">AI-powered detection</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Brain size={24} className="text-accent flex-shrink-0" weight="duotone" />
                  <div>
                    <div className="font-semibold text-sm">AI Insights</div>
                    <div className="text-xs text-muted-foreground">Gemini-powered analysis</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Lightning size={24} className="text-success flex-shrink-0" weight="duotone" />
                  <div>
                    <div className="font-semibold text-sm">Auto Remediation</div>
                    <div className="text-xs text-muted-foreground">One-click fixes</div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
              <Shield size={18} weight="duotone" />
              <span>Secure authentication with GitHub OAuth</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-2 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription className="text-base">
                  Sign in with your GitHub account to access your personalized monitoring dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    onClick={onLogin}
                    disabled={isLoading}
                    className="w-full h-14 text-base gap-3 bg-[#24292e] hover:bg-[#1a1e22] text-white shadow-lg hover:shadow-xl transition-shadow"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Waveform size={20} weight="bold" />
                        </motion.div>
                        Authenticating with GitHub...
                      </>
                    ) : (
                      <>
                        <GithubLogo size={26} weight="fill" />
                        Sign in with GitHub OAuth
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">Secure Authentication</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <GithubLogo size={18} weight="fill" className="text-primary" />
                      <span>GitHub OAuth Permissions</span>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <span>Your GitHub profile information (name, avatar, email)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <span>Secure encrypted data storage for your metrics</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <span>Real-time collaboration with team members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-center text-muted-foreground">
                    <Shield size={14} weight="duotone" className="text-success" />
                    <span>No credit card required • Free to use • Industry-standard OAuth 2.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
