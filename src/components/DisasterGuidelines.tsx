import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  Phone,
  Shield,
  Waves,
  Zap,
  Mountain,
  Wind,
  Flame,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { VERNACULAR_GUIDELINES } from '@/utils/vernacularData';

const DisasterGuidelines: React.FC = () => {
  const { language } = useLanguage();
  const content = VERNACULAR_GUIDELINES[language] || VERNACULAR_GUIDELINES.en;

  const getDisasterIcon = (typeKey: string) => {
    switch (typeKey) {
      case 'flood':
        return <Waves className="h-7 w-7 text-blue-500" />;
      case 'earthquake':
        return <Zap className="h-7 w-7 text-amber-500" />;
      case 'landslide':
        return <Mountain className="h-7 w-7 text-amber-700" />;
      case 'cyclone':
        return <Wind className="h-7 w-7 text-teal-500" />;
      case 'fire':
        return <Flame className="h-7 w-7 text-rose-500" />;
      default:
        return <AlertTriangle className="h-7 w-7 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'अति गंभीर':
      case 'അതിതീവ്രം':
      case 'Critical':
        return 'severity-high';
      case 'medium':
      case 'मध्यम':
      case 'മിതമായത്':
      case 'Medium':
        return 'severity-medium';
      default:
        return 'severity-low';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{content.title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{content.subtitle}</p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <Card className="glass border-border/20 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-destructive" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">{content.emergencyContactsTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {content.contacts.map((contact) => (
            <div key={contact.number} className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 border border-border/30">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground">{contact.name}</div>
                <div className="text-lg font-mono font-bold text-primary">{contact.number}</div>
                <div className="text-xs text-muted-foreground">{contact.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Disaster-specific guidelines */}
      {content.categories.map((guideline) => (
        <Card key={guideline.typeKey} className={`glass border-border/20 p-5 sm:p-6 ${getSeverityColor(guideline.severity)}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xs">
                {getDisasterIcon(guideline.typeKey)}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">{guideline.disaster}</h3>
                <Badge className={getSeverityColor(guideline.severity)}>
                  {guideline.severity}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Before */}
            <div>
              <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {guideline.beforeTitle}
              </h4>
              <ul className="space-y-1.5 ml-6">
                {guideline.before.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* During */}
            <div>
              <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {guideline.duringTitle}
              </h4>
              <ul className="space-y-1.5 ml-6">
                {guideline.during.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div>
              <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                {guideline.afterTitle}
              </h4>
              <ul className="space-y-1.5 ml-6">
                {guideline.after.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            {guideline.resources && guideline.resources.length > 0 && (
              <div className="pt-3 border-t border-border/20">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">{guideline.officialResourcesTitle}</h4>
                <div className="flex flex-wrap gap-2">
                  {guideline.resources.map((resource, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        {resource.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Additional Resources */}
      <Card className="glass border-border/20 p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-4">{content.additionalResourcesTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.additionalResources.map((res, idx) => (
            <Button key={idx} variant="outline" asChild className="justify-start">
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs">
                <ExternalLink className="h-4 w-4" />
                {res.name}
              </a>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DisasterGuidelines;