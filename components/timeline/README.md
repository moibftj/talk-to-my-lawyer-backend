# Letter Generation Timeline Component

A professional timeline component designed for the Talk-to-My-Lawyer application that displays the progress of legal letter generation with AI and attorney review steps.

## Features

- **Progressive Step Visualization**: 15 animated progress bars showing completion status
- **Task Status Indicators**: Clear status for each generation step with icons
- **Loading Animations**: Smooth loading indicators during active steps
- **Professional Styling**: Dark theme with cyan accents matching legal app aesthetics
- **Responsive Design**: Works across all device sizes
- **Accessibility**: Semantic HTML and proper color contrast

## Usage

```jsx
import LetterGenerationTimeline from '@/components/timeline/LetterGenerationTimeline'

function MyComponent() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <LetterGenerationTimeline 
      isGenerating={isGenerating}
      currentStep={currentStep}
      onComplete={() => {
        console.log('Letter generation completed!')
      }}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isGenerating` | boolean | `false` | Whether the generation process is active |
| `currentStep` | number | `0` | Current step in the generation process (0-5) |
| `onComplete` | function | `() => {}` | Callback fired when all steps are completed |

## Timeline Steps

1. **Letter received and under attorney review** - Initial submission processing
2. **AI analysis and initial draft preparation** - AI system analyzing case details
3. **Attorney review and refinement** - Legal expert reviewing AI content
4. **Quality assurance and final review** - Final legal compliance check
5. **Letter ready for delivery** - Completed letter ready for download

## Task Status Items

The component displays these progressive status items:

- ✅ Initializing agent environment
- ✅ Allocating resources  
- 🔄 Loading agent state (with spinner when active)
- 🔄 Analyzing case details
- 🔄 Generating legal content

## Styling

The component uses:
- **Background**: Dark theme (`rgb(15, 15, 16)`)
- **Progress Bars**: Cyan gradient with glow effects
- **Typography**: Berkeley Mono Trial font family
- **Colors**: Professional gray and cyan color scheme
- **Animations**: Smooth transitions and pulse effects

## Implementation Notes

- Progress bars fill progressively (3 bars per completed step)
- Active loading states show animated spinners
- Completed steps show checkmark icons
- Text colors change based on completion status
- Component is fully contained with no external dependencies beyond Lucide icons

## Integration

This component integrates seamlessly with the user dashboard's letter generation flow:

1. User clicks "Generate Letter" 
2. Timeline component appears showing progress
3. Steps complete progressively over ~10-12 seconds
4. Success message appears when complete
5. User is redirected back to dashboard

## Demo

Visit `/timeline-demo` to see an interactive demonstration of the component.
