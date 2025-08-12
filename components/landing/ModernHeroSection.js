'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ModernHeroSection = ({ onGetStarted }) => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onGetStarted) {
      onGetStarted(email)
    }
  }

  return (
    <section className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'rgb(17, 17, 17)' }}>
      {/* Animated background container */}
      <div
        className="relative max-w-7xl mx-auto pt-8 md:pt-16 pb-8 md:pb-16 px-4 sm:px-8 md:px-16 overflow-hidden"
        style={{
          background: 'linear-gradient(197deg, rgb(17, 17, 17) 21.66%, rgb(25, 25, 25) 56.46%, rgb(64, 22, 160) 92.21%, rgb(63, 89, 228) 106.26%)',
          borderRadius: '0 0 24px 24px',
          animation: 'heroFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
          opacity: 0
        }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start relative z-10 max-w-7xl mx-auto gap-8 lg:gap-0">
          {/* Left content */}
          <div className="flex flex-col mt-4 md:mt-14 flex-1">
            <article className="mb-5 text-left">
              {/* First headline */}
              <h1
                className="relative text-left z-10 mb-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
                style={{
                  color: 'rgb(255, 254, 250)',
                  lineHeight: '1.1',
                  letterSpacing: '-0.02em',
                  fontFeatureSettings: '"ss02", "ss03", "ss04"',
                  maxWidth: '100%'
                }}
              >
                <span className="inline">
                  <span>Professional </span>
                  <span className="inline-block mt-1.5">Legal</span>
                </span>
                
                {/* Animated highlight box for "Letters" */}
                <span className="block sm:absolute sm:inline">
                  <span
                    className="inline-block relative overflow-hidden transition-all duration-[0.8s] ease-in-out"
                    style={{
                      backdropFilter: 'blur(3px)',
                      border: '1px solid rgb(150, 152, 157)',
                      borderRadius: '24px',
                      padding: '0 8px sm:0 16px',
                      marginLeft: '0 sm:10px',
                      marginBottom: '8px',
                      width: 'auto sm:335px',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle'
                    }}
                  >
                    <div className="grid h-full">
                      <span 
                        className="inline-block pr-1 w-fit h-20"
                        style={{
                          background: 'linear-gradient(76deg, rgb(63, 89, 228) 0%, rgb(242, 172, 132) 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          whiteSpace: 'pre',
                          textWrap: 'nowrap'
                        }}
                      >
                        Letters
                      </span>
                    </div>
                  </span>
                </span>
              </h1>

              {/* Second headline */}
              <h1
                className="flex flex-wrap relative text-left z-10 mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
                style={{
                  color: 'rgb(255, 254, 250)',
                  lineHeight: '1.1',
                  letterSpacing: '-0.02em',
                  fontFeatureSettings: '"ss02", "ss03", "ss04"',
                  maxWidth: '100%'
                }}
              >
                <span>That </span>
                <span className="block sm:inline">
                  <span
                    className="inline-block relative overflow-hidden transition-all duration-[0.8s] ease-in-out"
                    style={{
                      backdropFilter: 'blur(3px)',
                      border: '1px solid rgb(150, 152, 157)',
                      borderRadius: '24px',
                      padding: '0 8px sm:0 16px',
                      marginLeft: '0 sm:10px',
                      marginBottom: '8px',
                      width: 'auto sm:337px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div className="grid h-full">
                      <span 
                        className="inline-block pr-1 w-fit h-20"
                        style={{
                          background: 'linear-gradient(76deg, rgb(63, 89, 228) 0%, rgb(76, 183, 163) 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          whiteSpace: 'pre',
                          textWrap: 'nowrap'
                        }}
                      >
                        Get Results
                      </span>
                    </div>
                  </span>
                </span>
              </h1>
            </article>

            {/* Email form */}
            <div className="w-full max-w-lg mt-8">
              <div className="w-full">
                <form onSubmit={handleSubmit} className="w-full">
                  <fieldset
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 overflow-hidden"
                    style={{
                      backgroundColor: 'rgb(17, 17, 17)',
                      borderRadius: '16px',
                      padding: '8px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Your work email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 border-none outline-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: 'rgb(17, 17, 17)',
                          borderRadius: '8px',
                          fontSize: '16px',
                          lineHeight: '32px',
                          color: 'rgb(255, 254, 250)',
                          padding: '0 16px'
                        }}
                        aria-label="Your work email"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="relative flex items-center justify-center h-12 transition-all duration-[0.4s] ease-in-out overflow-hidden hover:scale-105 active:scale-95"
                      style={{
                        background: `
                          radial-gradient(223% 105.53% at 6.05% 199.17%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%),
                          radial-gradient(31.68% 130.91% at 100% 100%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%),
                          radial-gradient(43.14% 139.47% at 0% 136.21%, rgba(227, 235, 255, 0.3) 0%, rgba(227, 235, 255, 0) 100%),
                          linear-gradient(170deg, rgb(64, 22, 160) 7.99%, rgb(63, 89, 228) 93.36%)
                        `,
                        borderRadius: '6px',
                        border: '1px solid rgb(0, 0, 0)',
                        color: 'rgb(255, 254, 250)',
                        fontSize: '16px',
                        fontWeight: '500',
                        lineHeight: '24px',
                        padding: '12px 24px sm:12px 32px',
                        cursor: 'pointer',
                        minWidth: 'fit-content'
                      }}
                    >
                      <span className="relative text-center cursor-pointer">
                        Get started
                      </span>
                    </Button>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div
            className="w-full max-w-sm lg:max-w-xs xl:max-w-sm lg:w-auto lg:flex-shrink-0 mt-8 lg:mt-10 mx-auto lg:mx-0"
            style={{
              backdropFilter: 'blur(21px)',
              background: 'linear-gradient(26deg, rgba(255, 255, 255, 0.25) -32.04%, rgba(255, 255, 255, 0) 133.43%)',
              border: '1px solid rgb(255, 254, 250)',
              borderRadius: '16px',
              boxShadow: `
                rgba(0, 0, 0, 0.08) 0px 39.9736px 47.0278px 0px,
                rgba(0, 0, 0, 0.06) 0px 16.7px 19.6471px 0px,
                rgba(0, 0, 0, 0.047) 0px 8.92863px 10.5043px 0px,
                rgba(0, 0, 0, 0.04) 0px 5.00532px 5.88861px 0px,
                rgba(0, 0, 0, 0.03) 0px 2.65829px 3.12739px 0px,
                rgba(0, 0, 0, 0.024) 0px 1.10617px 1.30138px 0px
              `,
              padding: '24px sm:38.29px 32px sm:47px 24px sm:36.3px'
            }}
          >
            <img
              src="https://cdn.auth0.com/website/website/homepage/hero/login-box.svg"
              alt="Login box illustration"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .font-inter {
          font-family: Inter, sans-serif;
        }
      `}</style>
    </section>
  )
}

export default ModernHeroSection
