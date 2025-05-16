import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    // Plugin pour les dégradés
    ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>, variants?: string[]) => void }) => {
      const newUtilities = {
        // Dégradés principaux
        '.bg-teamwork-gradient': {
          background: 'linear-gradient(135deg, #162049 0%, #0097DD 100%)',
        },
        '.bg-teamwork-gradient-reverse': {
          background: 'linear-gradient(135deg, #0097DD 0%, #162049 100%)',
        },
        
        // Dégradés pour les boutons et éléments d'interface
        '.bg-accent-gradient': {
          background: 'linear-gradient(135deg, #0097DD 0%, #02cd82 100%)',
        },
        '.bg-warning-gradient': {
          background: 'linear-gradient(135deg, #ffce0a 0%, #f26151 100%)',
        },
        '.bg-success-gradient': {
          background: 'linear-gradient(135deg, #02cd82 0%, #0097DD 100%)',
        },
        '.bg-danger-gradient': {
          background: 'linear-gradient(135deg, #f26151 0%, #82053f 100%)',
        },
        
        // Dégradés pour les éléments spéciaux
        '.bg-sidebar-gradient': {
          background: 'linear-gradient(180deg, #162049 0%, #1a2a5a 100%)',
        },
        '.bg-header-gradient': {
          background: 'linear-gradient(90deg, #162049 0%, #0097DD 100%)',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
} satisfies Config;
