export const experiencePageConfigs = {
  'wine-tastings': {
    inquiryType: 'wine_tasting',
    meta: {
      title: 'Wine Tastings',
      description:
        'Explore intimate Friday wine tastings at La Norma with guided Italian pours, composed antipasti, and limited seating on Longboat Key.',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80',
    },
    hero: {
      eyebrow: 'Friday evenings at La Norma',
      title: 'Wine Tastings',
      accent: 'guided pours, warm lighting, and an evening worth planning around',
      description:
        'Each Friday, our sommelier leads a limited-seat tasting through Italy with composed pairings from the kitchen and pacing that still feels like a proper night out.',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80',
      imageAlt: 'Italian wine glasses and antipasti arranged on a candlelit table',
      metrics: [
        { value: '4-6', label: 'curated pours' },
        { value: '14', label: 'seats max' },
        { value: 'Friday', label: 'weekly cadence' },
      ],
      trustPills: ['Sommelier led', 'Antipasti pairings', 'Personal confirmation within 24 hours'],
      primaryActionLabel: 'Request a tasting',
      secondaryAction: {
        label: 'See upcoming Fridays',
        anchor: 'upcoming-evenings',
      },
      spotlight: {
        eyebrow: 'Why guests book it',
        title: 'An intimate tasting that still feels like dinner, not a classroom.',
        body:
          'The room stays conversational, the wines stay connected, and every course is timed to keep the night flowing naturally.',
        bullets: [
          'Regional storytelling that makes each pour feel connected',
          'Pairings designed with the kitchen, not bolted on afterward',
          'A refined format that works for dates, celebrations, and curious regulars',
        ],
      },
    },
    proofStrip: [
      {
        value: 'Weekly',
        label: 'Friday tasting series',
        detail: 'A recurring format guests can plan around with confidence.',
      },
      {
        value: 'Curated',
        label: 'Italian wine focus',
        detail: 'Themes move through producers, regions, and seasonal moods.',
      },
      {
        value: 'Personal',
        label: 'Small room energy',
        detail: 'Limited seating keeps the service attentive and the guidance human.',
      },
    ],
    events: {
      category: 'wine_tasting',
      anchor: 'upcoming-evenings',
      label: 'Upcoming tastings',
      heading: 'Choose the evening that suits your table',
      subheading:
        'Every tasting is capped on purpose so the room stays warm, attentive, and genuinely conversational.',
      emptyTitle: 'Upcoming dates are being curated',
      emptyBody:
        'Send us a flexible request below and we will suggest the next Friday that best fits your group.',
      availabilityMode: 'limited',
      ctaLabel: 'Request this Friday',
    },
    sections: [
      {
        type: 'features',
        theme: 'alt',
        label: 'Why it feels different',
        heading: 'A polished tasting without the stiffness',
        subheading:
          'This experience is designed to feel guided, generous, and easy to enjoy whether you are celebrating, learning, or simply reserving a better Friday evening.',
        items: [
          {
            icon: 'Story',
            title: 'Regional storytelling',
            desc: 'Each lineup is built around a clear theme so the wines feel connected instead of random.',
          },
          {
            icon: 'Pairing',
            title: 'Kitchen-led pairings',
            desc: 'Antipasti are composed alongside the pours, giving the night a real culinary arc.',
          },
          {
            icon: 'Guide',
            title: 'Approachable guidance',
            desc: 'Questions are welcome and expertise is never assumed. Curiosity is enough.',
          },
          {
            icon: 'Cadence',
            title: 'Refined pacing',
            desc: 'The evening is timed like dinner service, with room for conversation between pours.',
          },
        ],
      },
      {
        type: 'checklist',
        theme: 'dark',
        label: 'Included in your reservation',
        heading: 'What guests can expect each Friday',
        subheading:
          'The format is consistent enough to book confidently while still leaving room for each theme to feel distinct.',
        items: [
          'A guided flight of Italian wines chosen around a theme or producer story',
          'Composed antipasti pairings timed with the pours',
          'Personal commentary from our sommelier throughout the evening',
          'A limited-seat format that keeps the room relaxed and attentive',
          'Support for celebrations, dietary notes, and private tasting requests',
          'A follow-up confirmation handled directly by the restaurant team',
        ],
        asideTitle: 'Especially good for',
        asideBody:
          'Date nights, smaller birthday gatherings, visiting wine lovers, and guests who want a reservation with more character than a standard dinner booking.',
        asideItems: ['Couples', 'Small groups', 'Celebrations', 'Private tasting inquiries'],
      },
      {
        type: 'testimonials',
        label: 'Guest impressions',
        heading: 'What guests remember after the last pour',
        subheading:
          'The most consistent feedback is not about one bottle. It is about how complete the evening feels.',
        items: [
          {
            quote:
              'It felt intimate and elevated without ever becoming formal. We left talking about the whole night, not just the wine.',
            name: 'Elena & Marcus',
            context: 'Anniversary tasting guests',
          },
          {
            quote:
              'The pairings were thoughtful, the explanations were easy to follow, and the room stayed wonderfully relaxed.',
            name: 'Tanya R.',
            context: 'Friday tasting regular',
          },
          {
            quote:
              'Exactly the kind of premium Friday plan you hope to find on vacation: well-run, warm, and genuinely worth booking ahead.',
            name: 'Christopher P.',
            context: 'Visiting guest from Chicago',
          },
        ],
      },
    ],
    form: {
      anchor: 'reserve',
      label: 'Reserve your evening',
      heading: 'Tell us the Friday, guest count, and tone you have in mind',
      subheading:
        'Choose a listed tasting or stay flexible. We will personally confirm availability, timing, and any special notes within 24 hours.',
      submitLabel: 'Request reservation',
      successTitle: 'Your tasting request is in',
      successBody:
        'We will follow up shortly to confirm availability, timing, and any special notes for your table.',
      asideTitle: 'What happens next',
      asideItems: [
        'We review every request by hand and confirm availability within 24 hours.',
        'If your preferred Friday is full, we suggest the closest available tasting.',
        'Planning a private tasting? Mention it in the notes and we will outline options.',
      ],
      progressLabels: ['Choose the evening', 'Your details', 'Review and send'],
      trustItems: ['No payment required to submit', 'Handled directly by the La Norma team', 'We never send you into an automated queue'],
      fields: [
        {
          name: 'selected_event_id',
          type: 'event',
          label: 'Preferred tasting',
          required: false,
          helper: 'Choose a listed evening or stay flexible.',
        },
        { name: 'date', type: 'date', label: 'Alternative date', required: false },
        {
          name: 'guests',
          type: 'select',
          label: 'Guests',
          required: true,
          options: ['1', '2', '3', '4', '5', '6', '7', '8'],
          helper: 'Tell us the final guest count or closest range.',
        },
        { name: 'first_name', type: 'text', label: 'First name', required: true },
        { name: 'last_name', type: 'text', label: 'Last name', required: true },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          helper: 'We send the personal confirmation here.',
        },
        { name: 'phone', type: 'tel', label: 'Phone', required: false },
        {
          name: 'message',
          type: 'textarea',
          label: 'Notes',
          required: false,
          placeholder: 'Celebration details, dietary notes, or a request for a private tasting...',
        },
      ],
      initialValues: {
        selected_event_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: '',
        guests: '2',
        message: '',
      },
    },
    faq: [
      {
        q: 'Do I need wine knowledge to enjoy it?',
        a: 'No. The evening is designed to feel welcoming and curious, not academic. We explain every pour clearly and keep the tone relaxed.',
      },
      {
        q: 'What is included?',
        a: 'Expect a guided flight, composed antipasti pairings, and time to enjoy the room at a slower pace.',
      },
      {
        q: 'Can the tasting be booked privately?',
        a: 'Yes. Private tastings can be arranged for smaller groups or celebratory evenings with a custom format.',
      },
      {
        q: 'How quickly do requests get confirmed?',
        a: 'Usually within 24 hours. If a listed evening is no longer available, we suggest the next best option.',
      },
    ],
    cta: {
      heading: 'An evening built for good company, better pours, and no rush at all.',
      subheading: 'Fridays at La Norma are intentionally limited. Request the evening you want before it disappears.',
      primaryLabel: 'Request a tasting',
      primaryAnchor: 'reserve',
      secondaryLabel: 'Back to La Norma',
    },
  },
  'live-music': {
    inquiryType: 'live_music',
    meta: {
      title: 'Live Music',
      description:
        'Reserve dinner on live music nights at La Norma with intimate jazz, acoustic sets, and a premium dining atmosphere on Longboat Key.',
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
    },
    hero: {
      eyebrow: 'Wednesday and Saturday evenings',
      title: 'Live Music',
      accent: 'woven into dinner, not layered on top of it',
      description:
        'From jazz duos to acoustic Italian evenings, our performances are chosen to elevate the dining room while preserving conversation, pacing, and warmth.',
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
      imageAlt: 'A musician performing in a warm restaurant dining room',
      metrics: [
        { value: 'No cover', label: 'with dinner' },
        { value: 'Wed + Sat', label: 'most weeks' },
        { value: '50', label: 'seat dining room' },
      ],
      primaryActionLabel: 'Send request',
      secondaryAction: {
        label: 'See performance calendar',
        anchor: 'upcoming-evenings',
      },
    },
    events: {
      category: 'live_music',
      anchor: 'upcoming-evenings',
      label: 'Performance calendar',
      heading: 'Plan dinner around a music night',
      subheading:
        'We recommend requesting a table in advance for music evenings, especially if you are celebrating or hoping to sit in the main room.',
      emptyTitle: 'The next performers are being confirmed',
      emptyBody:
        'Send us your preferred date and we will let you know which evenings best fit the atmosphere you want.',
      availabilityMode: 'open',
      ctaLabel: 'Request this evening',
    },
    sections: [
      {
        type: 'features',
        theme: 'dark',
        label: 'Why it works',
        heading: 'Music that supports the room instead of competing with it',
        subheading:
          'The point is always the full evening: the table, the wine, the pace of service, and the sense that you can stay a little longer.',
        items: [
          {
            icon: 'Tone',
            title: 'Curated performers',
            desc: 'Acts are chosen for warmth, restraint, and the ability to shape atmosphere without overpowering the space.',
          },
          {
            icon: 'Dinner',
            title: 'Full dinner service',
            desc: 'The complete menu and wine list remain available on performance nights - no stripped-down experience.',
          },
          {
            icon: 'Seat',
            title: 'Requested placement',
            desc: 'If you want the performance room or a quieter corner, note it in your request and we will do our best.',
          },
          {
            icon: 'Event',
            title: 'Private event add-ons',
            desc: 'Selected musicians can also be arranged for rehearsal dinners and private celebrations.',
          },
        ],
      },
    ],
    form: {
      anchor: 'reserve',
      label: 'Request a music-night table',
      heading: 'Tell us which evening you have in mind',
      subheading:
        'Whether you want a table for two, a celebratory group, or information about musicians for a private event, we will guide you from here.',
      submitLabel: 'Send request',
      successTitle: 'We have your music-night request',
      successBody:
        'Our team will confirm the best available evening and table setup within 24 hours.',
      asideTitle: 'Helpful to know',
      asideItems: [
        'There is no cover charge for scheduled live music evenings.',
        'Reservations are recommended because the main room fills quickly on performance nights.',
        'For private events, we can advise on available musicians and formats.',
      ],
      trustItems: ['No cover charge', 'Personal confirmation within 24 hours', 'Handled by the restaurant directly'],
      progressLabels: ['Choose your evening', 'Your details', 'Review and send'],
      fields: [
        {
          name: 'selected_event_id',
          type: 'event',
          label: 'Preferred performance',
          required: false,
          helper: 'Choose a listed act or leave it flexible.',
        },
        { name: 'date', type: 'date', label: 'Alternative date', required: false },
        {
          name: 'guests',
          type: 'select',
          label: 'Guests',
          required: true,
          options: ['1', '2', '3', '4', '5', '6', '7', '8'],
        },
        { name: 'first_name', type: 'text', label: 'First name', required: true },
        { name: 'last_name', type: 'text', label: 'Last name', required: true },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          helper: 'We use this for confirmation.',
        },
        { name: 'phone', type: 'tel', label: 'Phone', required: false },
        {
          name: 'message',
          type: 'textarea',
          label: 'Notes',
          required: false,
          placeholder: 'Preferred seating, occasion details, or a question about private-event music...',
        },
      ],
      initialValues: {
        selected_event_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: '',
        guests: '2',
        message: '',
      },
    },
    faq: [
      {
        q: 'Is there a cover charge?',
        a: 'No. Scheduled performances are part of the dining experience and do not carry a separate ticket fee.',
      },
      {
        q: 'Can I request a specific part of the room?',
        a: 'Yes. Tell us if you would like to be closer to the performers or prefer a quieter table, and we will accommodate whenever possible.',
      },
      {
        q: 'What kind of music do you host?',
        a: 'Most evenings feature jazz, acoustic Italian sets, strings, or similarly elegant formats that match the tone of dinner service.',
      },
      {
        q: 'Can musicians be booked for private events?',
        a: 'Yes. We can outline available performers and advise on what works best for your guest count and timing.',
      },
    ],
    cta: {
      heading: 'Dinner first. Atmosphere always. Music exactly where it belongs.',
      subheading: 'Ask about the next performance night and let us shape the evening around your table.',
      primaryLabel: 'Request your table',
      primaryAnchor: 'reserve',
      secondaryLabel: 'Back to La Norma',
    },
  },
  'private-events': {
    inquiryType: 'private_event',
    meta: {
      title: 'Private Events',
      description:
        'Plan refined private dining, rehearsal dinners, and milestone events at La Norma with curated menus, wine guidance, and hands-on hospitality.',
      image: 'https://images.unsplash.com/photo-1470042660615-51b9c62e8d28?w=1600&q=80',
    },
    hero: {
      eyebrow: 'Celebrations, dinners, and private hospitality',
      title: 'Private Events',
      accent: 'thoughtful planning, polished service, and a room worth gathering in',
      description:
        'From intimate celebratory dinners to full-room occasions, we tailor the pacing, menu, wine, and guest experience so the event feels seamless from arrival to the final toast.',
      image: 'https://images.unsplash.com/photo-1470042660615-51b9c62e8d28?w=1600&q=80',
      imageAlt: 'An elegantly set private dining table with candlelight',
      metrics: [
        { value: '12-30', label: 'guest formats' },
        { value: 'Custom', label: 'menus and wine' },
        { value: '24 hrs', label: 'response time' },
      ],
      trustPills: ['Rehearsal dinners', 'Milestone celebrations', 'Tailored menus and wine'],
      primaryActionLabel: 'Start your inquiry',
      secondaryAction: {
        label: 'Explore event formats',
        anchor: 'event-formats',
      },
      spotlight: {
        eyebrow: 'Designed for hosts',
        title: 'A private event experience that feels organized before guests even arrive.',
        body:
          'We help shape menu flow, timing, room setup, and hospitality details early so the evening feels calm and polished on the day itself.',
        bullets: [
          'Warm planning support for personal and professional occasions',
          'Menus and wine guidance tailored to guest count and tone',
          'A room experience designed to feel considered rather than generic',
        ],
      },
    },
    proofStrip: [
      {
        value: 'Tailored',
        label: 'Menu development',
        detail: 'Chef-led planning built around your guest list and occasion.',
      },
      {
        value: 'Flexible',
        label: 'Room formats',
        detail: 'Private dinners, celebration rooms, and full buyouts with a clear point of view.',
      },
      {
        value: 'Personal',
        label: 'Planning support',
        detail: 'One-on-one follow-up that keeps the process confident and easy to navigate.',
      },
    ],
    sections: [
      {
        type: 'packages',
        theme: 'light',
        anchor: 'event-formats',
        label: 'Event formats',
        heading: 'Choose the scale that fits the occasion',
        subheading:
          'Every event is tailored, but these starting formats help frame guest count, service style, and the level of exclusivity you may need.',
        items: [
          {
            icon: 'DIN',
            name: 'Intimate Dinner',
            capacity: 'Up to 12 guests',
            desc: 'A private dining experience for anniversaries, family milestones, and smaller business dinners.',
            includes: ['Dedicated service team', 'Custom 3-course format', 'Welcome prosecco', 'Flexible table setup'],
            featured: false,
          },
          {
            icon: 'CEL',
            name: 'Celebration Room',
            capacity: 'Up to 20 guests',
            desc: 'Our most requested format for rehearsal dinners, birthdays, and hosted evenings with wine pairings.',
            includes: ['Exclusive use of the private room', 'Custom 4-course menu', 'Pairing options', 'Decor coordination', 'Optional live music'],
            featured: true,
          },
          {
            icon: 'BUY',
            name: 'Full Buyout',
            capacity: 'Up to 30 guests',
            desc: 'For milestone gatherings that call for the full dining room, dedicated hospitality, and a completely custom flow.',
            includes: ['Full restaurant buyout', 'Tailored menu development', 'Sommelier-led wine service', 'Dedicated planning support'],
            featured: false,
          },
        ],
      },
      {
        type: 'features',
        theme: 'alt',
        label: 'Why La Norma',
        heading: 'The details are handled so the occasion can actually be enjoyed',
        subheading:
          'We focus on food, service, and pacing with the same seriousness as the atmosphere. That combination matters when the night means something.',
        items: [
          {
            icon: 'Chef',
            title: 'Chef-led menu planning',
            desc: 'Menus are shaped around the guest list, dietary needs, and the tone of the occasion.',
          },
          {
            icon: 'Wine',
            title: 'Thoughtful wine guidance',
            desc: 'Pairings, aperitivo selections, and bottle pacing are all handled with the meal in mind.',
          },
          {
            icon: 'Flow',
            title: 'Polished event pacing',
            desc: 'We help map arrival moments, speeches, courses, and transitions so the evening never feels rushed.',
          },
          {
            icon: 'Care',
            title: 'Warm, personal hospitality',
            desc: 'Guests should feel looked after, not processed. That standard shapes every event we host.',
          },
        ],
      },
      {
        type: 'checklist',
        theme: 'dark',
        label: 'What we help coordinate',
        heading: 'Support that keeps the event feeling polished',
        subheading:
          'We are not only providing a room. We are helping shape the guest experience from arrival through final course.',
        items: [
          'Format guidance based on guest count, privacy needs, and tone',
          'Menu recommendations with dietary planning and pacing in mind',
          'Wine and aperitivo structure suited to the occasion',
          'Advice on speeches, arrivals, and major transitions throughout the night',
          'Clear communication on availability, minimums, and deposits',
          'Optional enhancements such as floral styling or live music guidance',
        ],
        asideTitle: 'Common event types',
        asideBody:
          'We regularly host rehearsal dinners, birthdays, anniversaries, corporate dinners, family gatherings, and milestone celebrations with a more elevated hospitality standard.',
        asideItems: ['Rehearsal dinners', 'Milestone birthdays', 'Corporate hosting', 'Family celebrations'],
      },
      {
        type: 'testimonials',
        label: 'Host feedback',
        heading: 'What makes the planning feel easier',
        subheading:
          'Hosts usually remember two things most: the calm before the event and how well looked after their guests felt in the room.',
        items: [
          {
            quote:
              'They made our rehearsal dinner feel beautifully organized without ever making it feel formal or stressful.',
            name: 'Lindsay M.',
            context: 'Rehearsal dinner host',
          },
          {
            quote:
              'From menu planning to wine pacing, every recommendation felt practical and tasteful. We could actually enjoy our own event.',
            name: 'Daniel K.',
            context: 'Birthday celebration host',
          },
          {
            quote:
              'It felt like a boutique hospitality experience rather than a generic private room rental. That difference really showed up on the night.',
            name: 'Amelia & Jon',
            context: 'Anniversary dinner hosts',
          },
        ],
      },
    ],
    form: {
      anchor: 'inquire',
      label: 'Start the conversation',
      heading: 'Share the shape of your event',
      subheading:
        'Tell us your preferred date, guest range, and the kind of evening you are planning. We will come back with availability, recommendations, and next steps.',
      submitLabel: 'Send inquiry',
      successTitle: 'Your event inquiry has been received',
      successBody:
        'We will be in touch within 24 hours with availability guidance, menu direction, and any follow-up questions.',
      asideTitle: 'Planning support includes',
      asideItems: [
        'Guidance on guest count, room format, and ideal pacing for the evening.',
        'Advice on menu structure, wine, dietary accommodations, and service style.',
        'Clear follow-up on availability, minimums, and any deposits required to hold the date.',
      ],
      progressLabels: ['Event basics', 'Your details', 'Review and send'],
      trustItems: ['Handled directly by the restaurant team', 'Clear follow-up within 24 hours', 'A thoughtful recommendation, not a generic reply'],
      fields: [
        {
          name: 'guests',
          type: 'select',
          label: 'Guest range',
          required: true,
          options: ['6-10', '11-16', '17-20', '21-30'],
          helper: 'Choose the closest group size so we can suggest the right format.',
        },
        { name: 'date', type: 'date', label: 'Preferred date', required: false },
        {
          name: 'event_type',
          type: 'select',
          label: 'Type of occasion',
          required: false,
          options: [
            'Anniversary dinner',
            'Birthday celebration',
            'Rehearsal dinner',
            'Corporate dinner',
            'Family gathering',
            'Other',
          ],
        },
        { name: 'first_name', type: 'text', label: 'First name', required: true },
        { name: 'last_name', type: 'text', label: 'Last name', required: true },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          helper: 'We will reply here first.',
        },
        { name: 'phone', type: 'tel', label: 'Phone', required: false },
        {
          name: 'message',
          type: 'textarea',
          label: 'Tell us more',
          required: false,
          placeholder: 'Timing notes, budget expectations, dietary needs, music requests, decor thoughts, or anything else useful...',
        },
      ],
      initialValues: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: '',
        guests: '11-16',
        event_type: '',
        message: '',
      },
    },
    faq: [
      {
        q: 'How far ahead should we inquire?',
        a: 'For smaller groups, three to four weeks is ideal. For full buyouts or peak-season dates, earlier is strongly recommended.',
      },
      {
        q: 'Can menus be adjusted for dietary restrictions?',
        a: 'Yes. Vegetarian, gluten-free, allergy-conscious, and mixed-diet guest lists can all be accommodated with advance planning.',
      },
      {
        q: 'Is a deposit required?',
        a: 'Some event formats require a deposit to secure the date. We explain this clearly once availability and scope are confirmed.',
      },
      {
        q: 'Can live music be added?',
        a: 'Yes. Selected formats can include live music or a musician from our preferred roster, depending on the tone of your event.',
      },
    ],
    cta: {
      heading: 'A special occasion deserves more than a room and a menu.',
      subheading: 'Let us shape a private evening that feels polished, warm, and distinctly La Norma.',
      primaryLabel: 'Send your inquiry',
      primaryAnchor: 'inquire',
      secondaryLabel: 'Back to La Norma',
    },
  },
};
