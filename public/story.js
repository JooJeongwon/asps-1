// Compile the original four prologues into native Monogatari labels and actions.
// The engine owns progression, rollback, save/load, typing and the dialog log.
(() => {
  const routes = window.YEONBUN_ROUTES;
  const script = {
    Start: [
      "show scene scenes with scene-1",
      {
        Choice: {
          Dialog: "n 이 봄을, 누구와 시작할까요?",
          Class: "cast-choices",
          ...Object.fromEntries(
            routes.map((route, index) => [
              `Route${index}`,
              {
                Text: `<img src="/assets/${window.YEONBUN_PORTRAITS[route.name]}" alt="" draggable="false"><span class="cast-name">${route.name}</span><small>${route.pillar}</small>`,
                Do: `jump Route${index}`,
              },
            ]),
          ),
        },
      },
    ],
  };
  routes.forEach((route, routeIndex) => {
    const character = `c${routeIndex}`;
    script[`Route${routeIndex}`] = [
      // A new/restarted prologue is an intentional rollback boundary.
      function () {
        this.storage({
          route: routeIndex,
          decisions: route.scenes.map(() => null),
        });
        return true;
      },
      `jump R${routeIndex}S0`,
    ];
    route.scenes.forEach((scene, step) => {
      script[`R${routeIndex}S${step}`] = [
        `show scene scenes with scene-${routeIndex}`,
        `show character ${character} portrait`,
        `n ${scene.narration}`,
        {
          Choice: {
            Dialog: `${character} ${scene.line}`,
            ...Object.fromEntries(
              scene.choices.map((choice, index) => [
                `Answer${index}`,
                {
                  Text: choice.text,
                  Do: `jump R${routeIndex}S${step}A${index}`,
                  onChosen() {
                    this.storage().decisions[step] = index;
                  },
                  onRevert() {
                    this.storage().decisions[step] = null;
                  },
                },
              ]),
            ),
          },
        },
      ];
      scene.choices.forEach((choice, index) => {
        script[`R${routeIndex}S${step}A${index}`] = [
          `${character} ${choice.reply}`,
          step < route.scenes.length - 1
            ? `jump R${routeIndex}S${step + 1}`
            : {
                Conditional: {
                  Condition() {
                    return (
                      this.storage().decisions.reduce(
                        (total, choice, index) =>
                          total +
                          (route.scenes[index].choices[choice]?.affinity || 0),
                        0,
                      ) >=
                      (route.endingThreshold ??
                        Math.ceil(route.scenes.length * 1.5))
                    );
                  },
                  True: `jump R${routeIndex}EndClose`,
                  False: `jump R${routeIndex}EndSlow`,
                },
              },
        ];
      });
    });
    for (const [kind, ending] of Object.entries(route.endings)) {
      script[`R${routeIndex}End${kind === "close" ? "Close" : "Slow"}`] = [
        {
          Choice: {
            Dialog: `n <span class="ending-title">${ending.title}</span>${ending.copy}`,
            Class: "epilogue-choices",
            Again: {
              Text: "다른 선택으로 다시 만나기",
              Do: `jump Route${routeIndex}`,
            },
            Other: { Text: "다른 사람 만나기", Do: "jump Start" },
          },
        },
      ];
    }
  });
  window.YEONBUN_STORY = script;
})();
